-- SQL to promote admin@nexusbuild.app to admin
UPDATE "User"
SET "isAdmin" = true,
    "isModerator" = true,
    "bio" = 'NexusBuild Administrator'
WHERE email = 'admin@nexusbuild.app';