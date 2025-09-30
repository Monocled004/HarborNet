
import requests
import os
from database.connect import SessionLocal
from database.db_models import SocialPost


# -------------------------
# Fetch Twitter Posts
# -------------------------
def fetch_twitter_posts():
    url = "https://api.twitter.com/2/tweets/search/recent"
    query = "flood OR tsunami OR 'high waves' OR 'coastal damage' lang:en"
    headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
    params = {"query": query, "max_results": 10, "tweet.fields": "created_at,author_id,text"}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        print("Twitter Error:", response.text)
        return []
    return response.json().get("data", [])

# -------------------------
# Fetch YouTube Comments
# -------------------------
def fetch_youtube_comments():
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": "flood OR tsunami OR high waves OR coastal damage",
        "type": "video",
        "maxResults": 5,
        "key": YOUTUBE_API_KEY
    }
    search_res = requests.get(search_url, params=params).json()
    comments = []
    for item in search_res.get("items", []):
        video_id = item["id"]["videoId"]
        comment_url = "https://www.googleapis.com/youtube/v3/commentThreads"
        c_params = {"part": "snippet", "videoId": video_id, "maxResults": 5, "key": YOUTUBE_API_KEY}
        c_res = requests.get(comment_url, params=c_params).json()
        for c in c_res.get("items", []):
            comment = c["snippet"]["topLevelComment"]["snippet"]
            comments.append({
                "text": comment["textDisplay"],
                "author": comment["authorDisplayName"],
                "time": comment["publishedAt"]
            })
    return comments

# -------------------------
# Store Data in SQLAlchemy
# -------------------------
def store_post(platform, content, username, timestamp):
    session = SessionLocal()
    post = SocialPost(platform=platform, content=content, username=username, timestamp=timestamp)
    session.add(post)
    session.commit()
    session.close()

# -------------------------
# Utility: Fetch and store all social posts
# -------------------------
def fetch_and_store_all():
    tweets = fetch_twitter_posts()
    for t in tweets:
        store_post("Twitter", t.get("text", ""), t.get("author_id", ""), t.get("created_at", ""))
    yt_comments = fetch_youtube_comments()
    for c in yt_comments:
        store_post("YouTube", c.get("text", ""), c.get("author", ""), c.get("time", ""))
    return {"message": "Data fetched and stored!", "tweets": len(tweets), "youtube_comments": len(yt_comments)}
