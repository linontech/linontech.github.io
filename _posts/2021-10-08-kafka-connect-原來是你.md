---
layout: post
title: "kafka connect 原來是你"
subtitle: ""
date: 2021-10-08
categories: [技術]
---

### # 前情提要

應用場景需要將插入 Oracle 資料庫的資料，用串流的方式寫入 Kafka，Oracle 官方提供的解決方案是 OCIS，Oracle
Cloud Infrastructure Stream 裡面的 Kafka Connect Harness，沒有錯這是一個付費服務，估計是在原先開源 Kafka 
Connect 對 Oracle 的支持上進行了優化，如果口袋沒有很深去嘗試使用它，真的就只能好好調研一下了。是說這篇是要介紹
Kafka Connect的啦，趕快拉回正題。

Kafka Connect 是一個介接其他數據庫和 Kafka 之間的串流工具，它繼承了 Kafka 的可擴展性(scalability)和高可靠性(reliably)
。它可以接收整個數據庫，比如 Oracle，或者收集特定的指標，送到指定的 Kafka topic。

REST API

### # Source Connector Modes

- bulk modes

  整張表每次都重新讀一遍。

- Incremental Mode With Incrementing Column

  用一個遞增的欄位做辨別，只讀取新的資料。

- Incremental Mode With Timestamp Column

  用一個時間欄位當做 Kafka Connect 抓取資料的依據，並假設資料更新會同時更新時間戳記。會讀取新的或者更新後的資料。

- Incremental Mode With Incrementing and Timestamp Columns

  使得每一行數據都可以被對應到一個唯一的串流 offset，如此才能在 timestamp 欄位更新時候，將更新後的那行數據送到 Kafka。


### # Incrementing Column

一個很好的問題是，遞增的欄位中可以有重複的欄位嗎？直覺反應是當然不行咯，但是官方介紹裡面也沒有寫的很明白，還是說 strictly
(嚴格遞增的) 指的就是那個意思。很容易讓人產生疑問，是不是在預設每5秒在 sink 資料的時候，會把大於等於記錄的 offset 的所有數據
，包括可能重複的數據，都取回來。測試的結果，Kafka connect 會把有重複 incrementing 欄位的數據取回來，只要那個欄位的值大於等於當前記錄的
offset。

```
incrementing: use a strictly incrementing column on each table to detect only new rows. Note that this will not detect modifications or deletions of existing rows.
```

在 Oracle 中，想建立一個遞增欄位，不像 MySQL 一樣簡單添加 AUTO_INCREMENT 欄位關鍵字，或者 Postgres 使用 serial
型態，可以簡單的解決。至少在 Oracle 11g 之前的版本都還是這樣的，在11g的版本前都要使用 Oracle 的 trigger 來達成。
一直到 Oracle 12c，Oracle 的 identity 關鍵字才出來。

```sql
-- reference https://stackoverflow.com/questions/11296361/how-to-create-id-with-auto-increment-on-oracle
-- Table definition
CREATE TABLE departments (
ID           NUMBER(10)    NOT NULL,
DESCRIPTION  VARCHAR2(50)  NOT NULL);

ALTER TABLE departments ADD (
CONSTRAINT dept_pk PRIMARY KEY (ID));

CREATE SEQUENCE dept_seq START WITH 1;

-- Oracle trigger for incrementing column
CREATE OR REPLACE TRIGGER dept_bir
BEFORE INSERT ON departments
FOR EACH ROW

BEGIN
SELECT dept_seq.NEXTVAL
INTO   :new.id
FROM   dual;
END;
```

### # ORA-02437 Error Message

但是，一個遞增的欄位裡面的值對於大型的交易系統，遲早會達到系統可以表示的最大的值，到時候就會開始噴錯了。合理來說，如果
用時間戳來當這個遞增的欄位會比較好，但是如果交易頻率在每毫秒會同時有幾筆交易的話，就會產生重複的值。一個做法是，在插入
的時候額外添加一個序號，表示是當前微秒的第幾筆交易，但是這樣就涉及到會要先查詢目前最大的序號是多少的情況。查詢緊接著插入，
查詢到了未更新的最大序號值，導致會插入重複的值，發生錯誤。
