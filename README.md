# API Combats
API игры "combats"

## Общая информация
В случае GET запроса всегда передавайте параметры в URL
В случае POST запроса всегда передавайте параметры в теле запроса кодированием `x-www-form-urlencoded`
При работе 

## Технические ручки
GET `/ping` 
всегда отвечает pong

## Ручки для пользователя
Все ручки для пользователя отвечают объектами вида 
```
{
    "status": "ok",
    "user": {данные пользователя}
}
```
POST `/register`
параметры: 
username - строка

Регистрирует пользователя 

POST `/login`
параметры: 
user_id - id пользователя

Авторизует пользователя. Выставляет на текущее время время последней активности.

GET `/whoami`
параметры: 
user_id - id пользователя

Показывает информацию о пользователе по токену. Выставляет на текущее время время последней активности.

## Ручки для списка тех, кто онлайн
GET `/online`
параметры

```
{
    "status": "ok",
    "users": [массив пользователей]
}
```

## Ручки для поединка
Все ручки для поединка отвечают объектами вида 
```
{
    "status": "ok",
    "combat": {данные боя}
}
```

данные боя - объект вида 
```
{
    "id": "j582tS",
    "status": "progress",
    "turn_status": true,
    "results": [
        [
            {
                "origin": {
                    "id": "yS8aUb",
                    "username": "dusty",
                    "last_active": 1526212321426
                },
                "target": {
                    "id": "WOBqSz",
                    "username": "admin",
                    "last_active": 1526213320805
                },
                "hit": 1,
                "blocked": false
            },
            {
                "hit": 2,
                "blocked": true
            }
        ],
        [
            {
                "origin": {
                    "id": "WOBqSz",
                    "username": "admin",
                    "last_active": 1526213592196
                },
                "target": {
                    "id": "yS8aUb",
                    "username": "dusty",
                    "last_active": 1526213638265
                },
                "hit": 2,
                "blocked": true
            },
            {
                "origin": {
                    "id": "yS8aUb",
                    "username": "dusty",
                    "last_active": 1526213638265
                },
                "target": {
                    "id": "WOBqSz",
                    "username": "admin",
                    "last_active": 1526213592196
                },
                "hit": 1,
                "blocked": false
            }
        ],
        [
            {
                "origin": {
                    "id": "yS8aUb",
                    "username": "dusty",
                    "last_active": 1526213697299
                },
                "target": {
                    "id": "WOBqSz",
                    "username": "admin",
                    "last_active": 1526213764075
                },
                "hit": 1,
                "blocked": false
            },
            {
                "origin": {
                    "id": "WOBqSz",
                    "username": "admin",
                    "last_active": 1526213764075
                },
                "target": {
                    "id": "yS8aUb",
                    "username": "dusty",
                    "last_active": 1526213697299
                },
                "hit": 4,
                "blocked": false
            }
        ]
    ],
    "you": {
        "id": "WOBqSz",
        "username": "admin",
        "last_active": 1526211881735,
        "health": 20
    },
    "enemy": {
        "id": "yS8aUb",
        "username": "dusty",
        "last_active": 1526212240325,
        "health": 28
    }
}
```
**Описание полей объекта боя**

`status` - строка 'pending', 'progress' или 'finished'

`turn_status` - булевское. говорит о том, пора ли делать ход. Ход пора делать тогда, когда статус 'progress' и на последнем шаге боя ход еще не сделан.

`results` - пошаговый лог боя

`you` - информация о вас (данные пользователя)

`enemy` - информация о противнике (данные пользователя)
