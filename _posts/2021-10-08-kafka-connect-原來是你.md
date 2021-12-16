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


### # Source Connector Modes

- bulk modes

  整張表每次都重新讀一遍。

- Incremental Mode With Incrementing Column

  用一個遞增的欄位做辨別，只讀取新的資料。

- Incremental Mode With Timestamp Column

  用一個時間欄位當做 Kafka Connect 抓取資料的依據，並假設資料更新會同時更新時間戳記。會讀取新的或者更新後的資料。

- Incremental Mode With Incrementing and Timestamp Columns

  每一行數據都可以被對應到一個唯一的串流 offset。
