import pytest
import asyncio


@pytest.fixture(scope="function")
def event_loop():
    """Create an event loop for each test function."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    
    yield loop
    loop.close()
