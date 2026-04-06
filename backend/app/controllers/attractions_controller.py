from fastapi import HTTPException
from app.services import attractions_service


async def get_all_attractions(db):
    return await attractions_service.list_attractions(db)


async def get_attraction_by_id(db, attraction_id):
    attraction = await attractions_service.get_attraction(db, attraction_id)

    if attraction is None:
        raise HTTPException(status_code=404, detail="Attraction not found")

    return attraction


async def create_attraction(db, attraction_data):
    return await attractions_service.add_attraction(db, attraction_data)