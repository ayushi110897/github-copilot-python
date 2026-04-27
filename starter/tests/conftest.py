import pytest
from app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a test app instance."""
    flask_app.config['TESTING'] = True
    return flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()