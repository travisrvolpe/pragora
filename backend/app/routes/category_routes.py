# routes/category_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.datamodels.post_datamodels import Category, Subcategory

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    serialized_categories = [{
        "category_id": c.category_id,
        "cat_name": c.cat_name
    } for c in categories]
    return {
        "status": "success",
        "data": {"categories": serialized_categories}
    }
@router.get("/{category_id}/subcategories")
async def get_subcategories(category_id: int, db: Session = Depends(get_db)):
    subcategories = db.query(Subcategory).filter(Subcategory.category_id == category_id).all()
    return {
        "status": "success",
        "data": {
            "subcategories": [{"id": s.subcategory_id, "name": s.name} for s in subcategories]
        }
    }