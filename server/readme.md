

auth 
    - register
        email
        password
        name
            *return message 'user created'
    - login
        email
        password
            *return token(jwt)

    - forgot password
        email
            *return message 'email sent code'
    - reset password
        email
        new password
        code
            *return message 'password reset'
    
user 
    - get user
        token
            *return user
    - update user
        token
        name
        email
        password
            *return message 'user updated'
    - delete user
        token
            *return message 'user deleted'

files
    - upload file
        token
        file
            *return message 'file uploaded'
    - create folder
        token
        folder name
            *return message 'folder created'
    - get folder
        token
        folder name
            *return folder
    - get files in folder
        token
        folder name
            *return files
    - get file
        token
        file name
            *return file

    - delete file
        token
        file name
            *return message 'file deleted'
    - delete folder
        token
        folder name
            *return message 'folder deleted'



