
# WorkNest

An online job portal for recruitment and job searching.

## Table of Contents
- [Authors](#authors)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Features](#features)
  - [Basic Account Features](#basic-account-features)
  - [System Administration](#system-administration)
  - [Job Posting](#job-posting)
  - [Job Search](#job-search)
  - [Feedback System](#feedback-system)
  - [Job Recommendations](#job-recommendations)
- [Demo](#demo)

## Authors

- [@trangphan](https://www.linkedin.com/authwall?trk=gf&trkInfo=AQEVrVCAevuzzAAAAZTj2g3QlLGlidwFy5swiWIqR1pbfetpbXtKRM-5T2bZInb0dIZy3y6CCHgpOotUSELGuS1ugiRIq6NoaY1jGIWKJ6T_WpWQFvCg0D1jt2o0mnmHwOBLg74=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Ftrang-phan-35b823156%2F)


## Tech Stack

**Client:** NextJS 14, TailwindCSS

**Server:** ASP.Core Web API 8, MSSQL


## Run Locally

Clone the project

```bash
  git clone https://github.com/phantrang2002/WorkNest.git
```

Set up the Database Server by running the ```Worknest-db-script.sql``` in MSSQL

Go to the project's backend directory

```bash
  cd api
```

Run the Backend Server

```bash
  dotnet watch run
```

Go to the project's frontend directory

```bash
  cd frontend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Features

### Basic Account Features
- **R1:** Users can register an account (with an option to choose between two types: candidate account or business account for employers. Before registering, users must accept the policies and terms).
- **R2:** Users can log in to the website after successful registration.
- **R3:** Users can recover or change their password.
- **R4:** Users can update their personal information.
- **R5:** Users can download CV templates.
- **R6:** Users can view terms and conditions.

### System Administration
- **R7:** Admins can suspend user accounts.
- **R8:** Admins can approve or reject job postings.
- **R9:** Admins can add, edit, and delete CV templates.
- **R10:** Admins can generate recruitment statistics and reports.
- **R11:** Admins can add, update, or remove system policies and terms.

### Job Posting
- **R12:** Employers can post job listings.
- **R13:** Employers can edit or delete their job postings.

### Job Search
- **R14:** Users can search for job postings using filters and a search bar.
- **R15:** Users can share job postings via social media and QR codes.
- **R16:** Candidates can apply for relevant job postings.

### Feedback System
- **R17:** Users can submit feedback and suggestions about the system.
- **R18:** Admins can notify users after processing their feedback.

### Job Recommendations
- **R19:** The system prioritizes job recommendations based on each user’s industry instead of displaying random listings.
## Demo
 
