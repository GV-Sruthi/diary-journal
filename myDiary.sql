CREATE database myDiary;
use myDiary;

create table Users(
ID int primary Key auto_increment,
EmailID varchar(50) unique,
HashedPassword varchar(100)
);

create table Posts(
ID int primary key auto_increment,
UserID int,
postTitle varchar(100),
postDescription varchar(1600),
foreign key(UserID) references Users(ID)
);
SELECT * from Users;
