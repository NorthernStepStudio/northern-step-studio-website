# API Reference

Development base URL: `http://localhost:3000/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `PUT /auth/update`

## Builds

- `GET /builds`
- `POST /builds`
- `PUT /builds/:id`
- `DELETE /builds/:id`
- `GET /builds/community`
- `GET /builds/featured`
- `POST /builds/:id/like`
- `POST /builds/:id/clone`
- `POST /builds/sync`

## Reports

- `POST /reports`
- `GET /reports/my`
- `GET /reports` (admin/moderator)
- `PATCH /reports/:id` (admin/moderator)

## Admin

- `GET /admin/stats`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `GET /admin/builds`

## Prices

- `GET /prices/health`
- `GET /prices/search`
- `GET /prices/trending/:category`
