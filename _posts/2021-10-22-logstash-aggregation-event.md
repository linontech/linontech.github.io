---
layout: post
title: "logstash aggregation events"
subtitle: ""
date: 2021-10-22
categories: [技術]
---

### # 前情提要

前陣子為了監控Spark Structured Streaming的ETL處理時間和TPS等指標，使用logstash接收來自Kafka的event數據，透過Kafka的
時間戳 CreateTime 來記錄資料處理時間，計算source Kafka topic的時間戳和sink端的 Kafka topic 的差值，可以得到這筆
event在ETL的耗時。


### # Aggregation

由於前端的事件進來Kafka並沒有一個唯一的key值做識別，所以在ETL處理的時候加入了 hash_id 針對整串資料包含時間戳記計算一個唯一值，
讓它可以再後續更複雜的ETL中被識別，算是一個前處理操作。並且，因為需要匯總各個ETL部分的耗時，小小的研究了一下Logstash 聚合事件
的功能的使用方式。可以想到的是，因為是即時串流的事件，資料在不斷的進來，我們幾乎不可能無限時間的等到所有相關的事件都進入 logstash
之後才進行聚合，隨著資料量的增加，對記憶體等硬件的要求也會越來越高，處理效率也會越來越差。所以一個合理的timeout時間設定，或者
合理的事件完成規則的定義就會非常重要了。

logstash官方對兩種方式都有相關的範例可以參考，aggregation filter的目的是聚合屬於同一任務的多個事件，有對應到前情提要中的場景。
官方舉例的一些應用場景有，

1. 任務對事件清楚定義了開始和結束的格式，比如TASK_START或者TASK_END等字樣。
2. 沒有定義開始的任務
3. 沒有定義結束的任務
4. 沒有定義開始，也沒有定義結束
5. 沒有定義結束事件，並且將事件在無相關活動狀態超時之後推送


### # logstash filter 累加不正確的問題

logstash對串流資料聚合的支持有一個限制，就是為了要聚合 events 只能使用一個 instance來處理資料，否則會出現奇怪的情況。在官方的
aggregate plugin的文檔上寫表明，`You should be very careful to set Logstash filter workers to 1 (-w 1 flag) 
for this filter to work correctly otherwise events may be processed out of sequence and unexpected results will occur.`
在 pipeline.yml 中需對那個有聚合操作的設定檔，加入 pipeline.workers: 1 ，才能保證聚合插件的正常使用，否則可能會出現數字累加錯誤，
或者事件未收齊就推送的現象。([ref](https://www.elastic.co/guide/en/logstash/current/plugins-filters-aggregate.html))

[這篇](Pipeline.workers configuration and aggregation filter) 裡面也有說到相關的情況。好在`pipeline.workers`的預設值就是 1。
所以對於不怎麼思考而是直接使用的人，有一定的防呆機制存在。
