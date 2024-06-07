CREATE TABLE Users (
    id UUID DEFAULT gen_random_uuid(),
    uname VARCHAR(64) UNIQUE NOT NULL,
    passwd VARChAR(40) NOT NULL,
    name VARCHAR(64) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Importances (
    id INT NOT NULL,
    val VARCHAR(32) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE CheckLists (
    id UUID DEFAULT gen_random_uuid(),
    subject VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    date TIMESTAMPTZ NOT NULL,
    importance_id INT,
    user_id UUID,
    PRIMARY KEY (id),
    CONSTRAINT fk_importance_id FOREIGN KEY (importance_id) REFERENCES Importances(id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES Users(id)
);

INSERT INTO Importances (id, val) VALUES (0, 'urgent');
INSERT INTO Importances (id, val) VALUES (1, 'general');