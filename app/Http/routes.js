'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.get('/', 'PageController.index')

Route.group('socialAuth', function () {
  Route.get('/auth/twitter', 'TwitterController.index')
  Route.get('/connect/twitter', 'TwitterController.connect')
  Route.get('/callback/twitter', 'TwitterController.callback')
}).prefix('/api')
