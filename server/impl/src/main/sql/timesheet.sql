drop table ENTRY;
drop table PROJECT_TASK;
drop table TASK;
drop table PROJECT;
drop table USER_TABLE;

create table USER_TABLE (
	ID serial primary key,
	EMAIL varchar(100) not null,
	PASSWORD varchar(100) not null,
	ENABLED boolean not null,
	ADMINISTRATOR boolean not null
);

create table PROJECT (
	ID serial primary key,
	NAME varchar(100) not null,
	USER_ID integer not null references USER_TABLE(ID)
);

create table TASK (
	ID serial primary key,
	NAME varchar(100) not null,
	USER_ID integer not null references USER_TABLE(ID)
);

create table PROJECT_TASK (
	PROJECT_ID integer references PROJECT(ID),
	TASK_ID integer references TASK(ID),
	primary key (PROJECT_ID, TASK_ID)
);

create table ENTRY (
	PROJECT_ID integer references PROJECT(ID),
	TASK_ID integer references TASK(ID),
	DATE DATE,	
	time numeric(3, 1) not null,
	primary key (PROJECT_ID, TASK_ID, DATE)
);

insert into USER_TABLE (EMAIL, PASSWORD, ENABLED, ADMINISTRATOR) values ('a', 'a', true, true);

insert into PROJECT (NAME, USER_ID) values ('Project 01', 1);
insert into PROJECT (NAME, USER_ID) values ('Project 02', 1);
insert into PROJECT (NAME, USER_ID) values ('Project 03', 1);
insert into PROJECT (NAME, USER_ID) values ('Project 04', 1);
insert into PROJECT (NAME, USER_ID) values ('Project 05', 1);

insert into TASK (NAME, USER_ID) values ('Task 01', 1);
insert into TASK (NAME, USER_ID) values ('Task 02', 1);
insert into TASK (NAME, USER_ID) values ('Task 03', 1);
insert into TASK (NAME, USER_ID) values ('Task 04', 1);
insert into TASK (NAME, USER_ID) values ('Task 05', 1);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (1, 1);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (1, 2);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (1, 3);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (1, 4);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (1, 5);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (2, 1);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (2, 2);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (2, 3);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (2, 4);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (2, 5);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (3, 1);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (3, 2);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (3, 3);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (3, 4);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (3, 5);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (4, 1);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (4, 2);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (4, 3);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (4, 4);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (4, 5);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (5, 1);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (5, 2);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (5, 3);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (5, 4);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (5, 5);

insert into USER_TABLE (EMAIL, PASSWORD, ENABLED, ADMINISTRATOR) values ('u', 'u', true, false);

insert into PROJECT (NAME, USER_ID) values ('Project 06', 2);
insert into PROJECT (NAME, USER_ID) values ('Project 07', 2);
insert into PROJECT (NAME, USER_ID) values ('Project 08', 2);
insert into PROJECT (NAME, USER_ID) values ('Project 09', 2);
insert into PROJECT (NAME, USER_ID) values ('Project 10', 2);

insert into TASK (NAME, USER_ID) values ('Task 06', 2);
insert into TASK (NAME, USER_ID) values ('Task 07', 2);
insert into TASK (NAME, USER_ID) values ('Task 08', 2);
insert into TASK (NAME, USER_ID) values ('Task 09', 2);
insert into TASK (NAME, USER_ID) values ('Task 10', 2);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (6, 6);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (6, 7);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (6, 8);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (6, 9);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (6, 10);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (7, 6);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (7, 7);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (7, 8);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (7, 9);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (7, 10);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (8, 6);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (8, 7);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (8, 8);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (8, 9);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (8, 10);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (9, 6);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (9, 7);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (9, 8);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (9, 9);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (9, 10);

insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (10, 6);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (10, 7);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (10, 8);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (10, 9);
insert into PROJECT_TASK (PROJECT_ID, TASK_ID) values (10, 10);