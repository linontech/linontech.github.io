---
layout: post
title: "Spark RDD APIs"
subtitle: ""
date: 2021-09-20
categories: [技術]
---

公司老舊的程式碼裡面有很多RDD的資料處理邏輯，其中就包括對資料的customer_id欄位的連接操作、對rdd內字符串的編碼轉換、
對rdd資料的鍵值格式轉換等。於是想來稍微整理一下一些RDD相關Pyspark API操作。

RDD(Resilient Distributed Dataset)

## Some RDD functions

如果函數返回一個新的 RDD，那麼他是一個 transformation，否則它就是一個 action。

Transformation

從一個RDD轉換成新的RDD，Transformation只是描述RDD的操作轉換，而不是實際的去執行。這個是Spark的
Lazy Evaluation機制。常見的包括，map，select、filter、withColumn 或者 groupby 等等都是屬於 Transformation。

Actions

實際執行所有的 Transformation，並返回結果到 driver。常見的包括，count()，collect()，show() 等等。


### # pyspark.RDD.map

這個是最直白的一個RDD操作了，即對RDD裡面的所有元素應用一個函數，並返回新的RDD。

### # pyspark.RDD.mapValues

只把RDD中的每個元素的value傳遞給函數，而不修改原來RDD的key值，也會回傳一個新的RDD，但是會保留原來RDD的分區。

### # pyspark.Rdd.flatMap

先將RDD中的函數應用一個函數，在將所有的結果展平成一個列表，預設是不會保留原始RDD的分區情況的。

### # pyspark.Rdd.flatMapValues

和 `pyspark.RDD.mapValues` 一樣，只傳遞RDD元素中的value。

### # pyspark.RDD.foreach

Applies a function to all elements of this RDD. (without returning a RDD) 這是一個 Action 操作。

### # pyspark.RDD.foreachPartition

Applies a function to each partition of this RDD. 傳遞給函數的是 RDD 的一個分區的資料的 iterator。
通常在函數中有數據庫連接，網絡API連接或文件批次處理時候使用，以分區為單位進行運算更能夠提供性能。

### # pyspark.RDD.groupBy

Return a RDD of grouped items. 非常特別，官方文件裡面的範例可以 groupby 一個函數的返回值。

### # pyspark.RDD.groupByKey

Group the values for each key in the RDD into a single sequence. Hash-partitions the resulting RDD 
with numPartitions partitions. **Hash-partitions** 

### # pyspark.RDD.reduce

使用交換或組合的二元運算符，例如累加或來減少 RDD 中的元素。白話來說，reduce將 RDD 中的所有元素兩個兩個輸入到函數中，
並返回一個新的值，新的值和下一個元素在輸入到函數中，直到整個 RDD 剩下一個元素。

### # pyspark.RDD.reduceByKey

白話來說，reduceByKey是把Key值相同的數據做歸併，比如經典的詞頻統計任務，Key就是單字，每次出現相同的Key就進行累加。
這是一個 Action 操作。

`Merge the values for each key using an associative and commutative reduce function.
This will also perform the merging locally on each mapper before sending results to a reducer, similarly 
to a “combiner” in MapReduce.`

### # pyspark.RDD.reduceByKeyLocally

獲得結果不需要再呼叫 collect 函數

`Merge the values for each key using an associative and commutative reduce function, 
but return the results immediately to the master as a dictionary.`

### # pyspark.RDD.aggregate

每個分區的聚合函數，必須提供3個參數，初始值、reduce函數1、reduce函數2，其中reduce函數1指的是在分區應用的reduce函數，
，每個分區最後會得到一個值，最後在透過reduce函數2進行合併。

### # pyspark.RDD.aggregateByKey

簡單理解 `aggregateByKey` 是對每個RDD中相同Key值的value做合併，所以它的返回結果類型也還會是一個 PairRDD，對應的是
Key和聚合之後的值。上面 `aggregate` 返回的則直接返回值。

### # pyspark.RDD.join

RDD 的連接函數，類似 SQL 中的 inner join。

### # pyspark.RDD.leftOuterJoin

返回結果以前面的RDD為主，如果匹配不上則會空。

### # pyspark.RDD.rightOuterJoin

返回結果以後面的RDD為主，如果匹配不上則會空。


## Reference

1. [pyspark documentation](https://spark.apache.org/docs/latest/api/python/reference/pyspark.html)
2. Apache Spark - foreach vs. foreachPartition When to use What? stackoverflow 
3. PySpark foreachPartition - Where is code executed？stackoverflow
