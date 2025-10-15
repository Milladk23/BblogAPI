# 📝 BblogAPI

A RESTful Blog API built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

## 🚀 Features
- User authentication (JWT)
- Create, read, update, delete blog posts
- Comment system(like / unlike a comment, and crud on it)
- Like / unlike posts
- Role-based access (admin, user)
- MongoDB integration with Mongoose
- Error handling middleware
- Sending photo alongside a post or you can have a profile picture(Multer and Sharp)

## 🧰 Tech Stack
- Node.js / Express.js
- MongoDB / Mongoose
- JWT Authentication
- Sharp / Multer
- Git / GitHub

## ⚙️ Installation
```bash
1- Clone the project
git clone https://github.com/Milladk23/BblogAPI.git
cd BblogAPI
2- Install packages
npm install packages
3- Run the project
npm run start

## 🔚 API endpoints

1️⃣ Authentication
| POST | api/v1/users/signup | Register new user |
| POST | api/v1/users/login | Login user |
| DELETE | api/v1/users/deleteMe | Delete user |
| PATCH | api/v1/users/updateMe | Update user account |
| PATCH | api/v1/users/updateMyPassword | Update user password |

2️⃣ Users
| GET | api/v1/users/ | Getting all users info |
| GET | api/v1/users/:id | Getting a user info |
| PATCH | api/v1/users/:id | Update a user info by admin |
| GET | api/v1/users/:id | Delete a user by admin |
| PATCH | api/v1/users/:id/follow | Follow a user |

3️⃣ Posts
| GET | api/v1/posts/ | Getting all posts |
| POST | api/v1/posts/ | create a post |
| GET | api/v1/posts/:id | Getting a post |
| DELETE | api/v1/posts/:id | Delete a post by author |
| DELETE | api/v1/posts/:id/force | Delete a post by admin |
| PATCH | api/v1/posts/:id | update a post |
| PATCH | api/v1/posts/:id/like | like a post |

4️⃣ Comments
| GET | api/v1/comments/ | Getting all comments |
| POST | api/v1/comments/ | create a comment |
| GET | api/v1/comments/:id | Getting a comment |
| DELETE | api/v1/comments/:id | Delete a comment by author |
| DELETE | api/v1/comments/:id/force | Delete a comment by admin |
| PATCH | api/v1/comments/:id | update a comment |
| PATCH | api/v1/comments/:id/like | like a comment |

## 📁 Project Structure
src/
 ┣ controllers/
 ┣ models/
 ┣ routes/
 ┣ utils/
  app.js
  package-lock.json
  package.json
