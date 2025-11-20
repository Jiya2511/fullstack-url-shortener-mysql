# 🔗 Secure URL Shortener with Real-time Analytics



[![Deployment Status](https://img.shields.io/badge/Status-Deployed-brightgreen)](https://fullstack-url-shortener-mysql.vercel.app/)

[![Built With](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20PostgreSQL-blue)](https://github.com/Jiya2511/fullstack-url-shortener-mysql)



## ✨ Live Demo & Access



* **Live Application:** [https://fullstack-url-shortener-mysql.vercel.app/] (Click to Register and Test!)

* **Backend API:** [https://dashboard.render.com/web/srv-d4dbrl49c44c7399dvg0]




## 💡 Project Overview

This is a full-stack, personalized URL shortening service built as a single-page application (SPA). It demonstrates secure user authentication, implements a relational database for permanent link storage, and tracks user-specific click analytics.

## 🚀 Key Features

* **Secure User Authentication (JWT):** Users must register and log in to manage their links.
* **Real-time Analytics:** Tracks and displays the exact number of times a shortened link has been clicked.
* **Personalized Dashboard:** Enforces **data isolation**, ensuring users only view and manage the links they created.
* **URL Redirection:** Handles efficient redirection using an Express routing parameter.



## 💻 Technical Stack

| Component | Technology | Rationale / Key Libraries |

| **Frontend** | **React.js (CRA)** | Built with functional components and modern hooks (useState, useEffect, useCallback). |
| **Backend API** | **Node.js & Express** | Creates a robust, scalable RESTful API. |
| **Database** | **PostgreSQL** | Used for stable, relational data storage (users and links). |
| **Security** | **JWT & bcryptjs** | Implements secure, stateless sessions and irreversible password hashing. |
| **Deployment** | **Vercel & Render** | Deployed the front-end (Vercel) and the secure API/DB (Render) for a production environment. |


## ⚙️ Local Development Setup

To run this application locally, you will need Node.js and a PostgreSQL server instance.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/Jiya2511/fullstack-url-shortener-mysql.git](https://github.com/Jiya2511/fullstack-url-shortener-mysql.git)
    cd fullstack-url-shortener-mysql
    ```

2.  **Install Dependencies:**
    ```bash
    npm install --prefix server
    npm install --prefix client
    ```

3.  **Database & Config:**
    * Set up a local PostgreSQL database.
    * Create a `.env` file in the `/server` directory with your **DB credentials** and a **`JWT_SECRET`**.

4.  **Run Application:**
    * Terminal 1 (Backend): `npm start --prefix server`
    * Terminal 2 (Frontend): `npm start --prefix client`


  ## 🌐 Deployment

The full-stack was deployed live using:

* **Render:** Hosts the Node.js API and the PostgreSQL database .
* **Vercel:** Hosts the compiled React client, which connects to the live Render API.
