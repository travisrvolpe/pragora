# app/applib/graphql/schema/__init__.py
import strawberry
from .schema import Query, Mutation, Subscription

# Create the schema instance using Strawberry
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)

__all__ = ['Query', 'Mutation', 'Subscription', 'schema']