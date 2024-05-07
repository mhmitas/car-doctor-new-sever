/*
* install jsonwebtoken
(i) jwt.sign(payload, 'secret', {expireIN:}) // create token
*
jwt.sign({
  data: 'foobar'
}, process.env..., { expiresIn: '1h' });
* 

- genarate secret.
require('crypto').randomBytes(64).toString('hex')

----------
? how to store token in the client side.
.
.
3. cookies: http only.

(ii) now set token in the cookie.
cookie('name', token, {options})
```
res
.cookie('myToken', token, { httpOnly: true, secure: false, sameSite: false })
.send({ success: true })
```

--------------
- express cookie parser()install

-------
1. set cookie with http only. for development secure `false`

2. cors setting

3. set client axios setting
















*/