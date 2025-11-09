"""
Tests for YouTube ingestion service
"""
import pytest
from app.services.youtube_ingest import YouTubeIngestionService


def test_extract_playlist_id():
    """Test playlist ID extraction from various URL formats"""
    service = YouTubeIngestionService()
    
    # Standard format
    url1 = "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
    assert service.extract_playlist_id(url1) == "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
    
    # With additional parameters
    url2 = "https://youtube.com/playlist?list=PLtest123&si=xyz"
    assert service.extract_playlist_id(url2) == "PLtest123"


def test_parse_duration():
    """Test YouTube duration parsing (ISO 8601)"""
    service = YouTubeIngestionService()
    
    # 1 hour 2 minutes 3 seconds
    assert service._parse_duration("PT1H2M3S") == 3723
    
    # 15 minutes
    assert service._parse_duration("PT15M") == 900
    
    # 45 seconds
    assert service._parse_duration("PT45S") == 45
    
    # 2 hours 30 minutes
    assert service._parse_duration("PT2H30M") == 9000


@pytest.mark.asyncio
async def test_ingest_playlist_mock():
    """Test playlist ingestion with mocked API"""
    # TODO: Add mock API responses when implementing full tests
    pass
