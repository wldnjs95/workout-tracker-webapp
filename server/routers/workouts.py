from fastapi import APIRouter, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
from models import Workout, DeleteExerciseRequest
import config

router = APIRouter()

# The correct order of columns in the spreadsheet
SPREADSHEET_HEADERS = ["id", "date", "category", "intensity", "exercise", "set_number", "plan", "actual", "notes"]

def rows_to_objects(rows):
    object_list = []
    for row in rows:
        padded_row = row + [''] * (len(SPREADSHEET_HEADERS) - len(row))
        object_list.append(dict(zip(SPREADSHEET_HEADERS, padded_row)))
    return object_list

@router.get("/workouts")
async def get_workouts():
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    
    range_name = f"{config.SHEET_NAME}!A:I" # Read all columns
    
    result = service.spreadsheets().values().get(
        spreadsheetId=config.SPREADSHEET_ID,
        range=range_name
    ).execute()
    
    values = result.get('values', [])
    data_rows = values[1:] if values else []
        
    return {"data": rows_to_objects(data_rows)}

@router.get("/workouts/{workout_id}")
async def get_workout_by_id(workout_id: str):
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    
    range_name = f"{config.SHEET_NAME}!A:I"
    
    result = service.spreadsheets().values().get(
        spreadsheetId=config.SPREADSHEET_ID,
        range=range_name
    ).execute()
    
    values = result.get('values', [])
    data_rows = values[1:] if values else []
    object_list = rows_to_objects(data_rows)
    
    workout_rows = [row for row in object_list if row.get("id") == workout_id]
    
    if not workout_rows:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    return {"data": workout_rows}

@router.post("/workouts")
async def add_workout(workout: Workout):
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)

    rows_to_append = []
    for exercise in workout.exercises:
        for s in exercise.sets:
            row = [
                workout.id,
                workout.date,
                workout.category,
                exercise.intensity,
                exercise.name, # exercise name
                s.setNumber,
                s.plan,
                s.actual,
                exercise.notes or ""
            ]
            rows_to_append.append(row)

    body = {
        'values': rows_to_append
    }
    # Append after the last row with data
    result = service.spreadsheets().values().append(
        spreadsheetId=config.SPREADSHEET_ID,
        range=f"{config.SHEET_NAME}!A1",
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body=body
    ).execute()

    return {"message": "Workout added successfully", "result": result}

@router.put("/workouts/{workout_id}")
async def update_workout(workout_id: str, workout: Workout):
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    sheet_name = config.SHEET_NAME
    spreadsheet_id = config.SPREADSHEET_ID

    try:
        # 1. Read all data
        range_name = f"{sheet_name}!A:I"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        all_rows = result.get('values', [])

        if not all_rows or len(all_rows) <= 1:
            raise HTTPException(status_code=404, detail="Cannot update workout in an empty sheet.")

        header_row = all_rows[0]
        data_rows = all_rows[1:]

        # 2. Filter out the old version of the workout
        rows_to_keep = [row for row in data_rows if len(row) > 0 and row[0] != workout_id]

        # 3. Create new rows from the updated workout data
        updated_rows = []
        for exercise in workout.exercises:
            for s in exercise.sets:
                row = [
                    workout.id,
                    workout.date,
                    workout.category,
                    exercise.intensity,
                    exercise.name,
                    s.setNumber,
                    s.plan,
                    s.actual,
                    exercise.notes or ""
                ]
                updated_rows.append(row)
        
        # 4. Combine the lists
        final_rows = rows_to_keep + updated_rows

        # 5. Clear and write back
        service.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A2:I"
        ).execute()

        if final_rows:
            body = {
                'values': final_rows
            }
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A2",
                valueInputOption='RAW',
                body=body
            ).execute()

        return {"message": f"Workout {workout_id} updated successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workouts/date/{date}")
async def delete_workout_by_date(date: str):
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    sheet_name = config.SHEET_NAME
    spreadsheet_id = config.SPREADSHEET_ID

    try:
        range_name = f"{sheet_name}!A:I"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        all_rows = result.get('values', [])

        if not all_rows or len(all_rows) <= 1:
            return {"message": "Sheet is empty or contains only headers."}

        header_row = all_rows[0]
        data_rows = all_rows[1:]

        rows_to_keep = [row for row in data_rows if len(row) > 1 and row[1] != date]

        service.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A2:I" # Clear only data rows
        ).execute()

        if rows_to_keep:
            body = {
                'values': rows_to_keep
            }
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A2", # Write data starting from A2
                valueInputOption='RAW',
                body=body
            ).execute()
            
        return {"message": f"Workouts for date {date} deleted successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workouts/delete-exercise")
async def delete_exercise(req: DeleteExerciseRequest):
    creds = service_account.Credentials.from_service_account_file(
        config.SERVICE_ACCOUNT_FILE, scopes=config.SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    sheet_name = config.SHEET_NAME
    spreadsheet_id = config.SPREADSHEET_ID

    try:
        range_name = f"{sheet_name}!A:I"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        all_rows = result.get('values', [])

        if not all_rows or len(all_rows) <= 1:
            return {"message": "Sheet is empty or contains only headers."}

        header_row = all_rows[0]
        data_rows = all_rows[1:]

        # Column indices: date is 1, exercise name is 4
        rows_to_keep = [row for row in data_rows if not (len(row) > 4 and row[1] == req.date and row[4] == req.exerciseName)]

        service.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A2:I"
        ).execute()

        if rows_to_keep:
            body = {
                'values': rows_to_keep
            }
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A2",
                valueInputOption='RAW',
                body=body
            ).execute()
            
        return {"message": f"Exercise '{req.exerciseName}' for date {req.date} deleted successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))