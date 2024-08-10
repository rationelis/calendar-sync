# Strava OAuth
[Strava API Settings](https://www.strava.com/settings/api)

1. Get a code for future token exchange with the proper scope.
```
https://www.strava.com/oauth/authorize?client_id=XX&response_type=code&scope=activity:read_all&redirect_uri=https://example.domain
```

2. Exchange the code for a token.
```
curl -X POST https://www.strava.com/oauth/token \
-F client_id=XX \
-F client_secret=XX \
-F code=XX \
-F grant_type=authorization_code
```

3. Save the token in the realtime database.
