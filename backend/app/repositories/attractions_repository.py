from sqlalchemy.orm import Session
from app.models.attraction import Attraction


def get_all_attractions(db: Session):
    return db.query(Attraction).all()


def get_attraction_by_id(db: Session, attraction_id: int):
    return db.query(Attraction).filter(Attraction.id == attraction_id).first()


def create_attraction(db: Session, attraction_data: dict):
    attraction = Attraction(**attraction_data)
    db.add(attraction)
    db.commit()
    db.refresh(attraction)
    return attraction