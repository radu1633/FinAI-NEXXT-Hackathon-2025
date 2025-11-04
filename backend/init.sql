-- init.sql

CREATE TABLE IF NOT EXISTS cv (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    title VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    company VARCHAR(100),
    role VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    cv_id INT REFERENCES cv(id)
);

CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    institution VARCHAR(100),
    degree VARCHAR(100),
    start_year INT,
    end_year INT,
    cv_id INT REFERENCES cv(id)
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100),
    level VARCHAR(50),
    cv_id INT REFERENCES cv(id)
);

-- populate CV
INSERT INTO cv (name, title, email, phone)
VALUES ('Sebastian Popescu', 'Software Developer', 'sebi@example.com', '+40 7xx xxx xxx');

INSERT INTO experience (company, role, start_date, end_date, description, cv_id)
VALUES 
('CodeFest', 'Fullstack Developer', '2024-01-01', '2025-06-01', 'Dezvoltare aplicație web full-stack cu .NET și React.', 1),
('ReVive', 'AI Engineer', '2025-06-01', NULL, 'Implementare modele AI pentru restaurarea imaginilor.', 1);

INSERT INTO education (institution, degree, start_year, end_year, cv_id)
VALUES ('Universitatea Ovidius din Constanța', 'Licență în Informatică', 2021, 2025, 1);

INSERT INTO skills (skill_name, level, cv_id)
VALUES 
('C# / .NET', 'Avansat', 1),
('Python', 'Avansat', 1),
('React + TypeScript', 'Intermediar', 1),
('PostgreSQL', 'Intermediar', 1),
('Docker', 'Intermediar', 1);

