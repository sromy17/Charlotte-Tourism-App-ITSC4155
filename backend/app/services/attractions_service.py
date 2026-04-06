from app.repositories import attractions_repository


def list_attractions(db):
    return attractions_repository.get_all_attractions(db)


def get_attraction(db, attraction_id):
    return attractions_repository.get_attraction_by_id(db, attraction_id)


def add_attraction(db, attraction_data):
    return attractions_repository.create_attraction(db, attraction_data)