drop table ENTRY;
drop table PROJECT_TASK;
drop table TASK;
drop table PROJECT;

create table PROJECT (
	ID serial primary key,
	NAME varchar(100) not null
);

create table TASK (
	ID serial primary key,
	NAME varchar(100) not null
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

insert into PROJECT (NAME) values ('Project 1');
insert into PROJECT (NAME) values ('Project 2');
insert into PROJECT (NAME) values ('Project 3');
insert into PROJECT (NAME) values ('Project 4');
insert into PROJECT (NAME) values ('Project 5');

insert into TASK (NAME) values ('Task 1');
insert into TASK (NAME) values ('Task 2');
insert into TASK (NAME) values ('Task 3');
insert into TASK (NAME) values ('Task 4');
insert into TASK (NAME) values ('Task 5');

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

insert into ENTRY (PROJECT_ID, TASK_ID, DATE, TIME) values (1, 1, CURRENT_DATE, 5.5);