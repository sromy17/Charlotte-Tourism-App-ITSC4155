from fastapi import APIRouter

router = APIRouter()


@router.get("/search")
def search_attractions() -> dict:
    """
    Search attractions using Yelp API - to be implemented.

    Returns:
            dict: Placeholder response
    """
    return {"message": "Attractions search endpoint - to be implemented"}
