from collections.abc import Generator

import pytest
from app.api.deps import get_db
from app.core.config import settings
from app.db.base import Base
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# We use the same engine but we will roll back the transaction
engine = create_engine(str(settings.database_url), pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db() -> Generator[None]:
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    yield
    # We do NOT drop all, because this is the same DB used for dev.
    # The tests will rely on transaction rollbacks.


@pytest.fixture
def db_session() -> Generator[Session]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient]:
    def override_get_db() -> Generator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

