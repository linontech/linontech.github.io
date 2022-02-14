--
layout: post
title: "ElasticSearch Removal of mapping types"
subtitle: ""
date: 2021-12-30
categories: [技術]
---

正好遇到舊叢集升版本，當然 ElasticSearch 的版本也升級了，從 6.1 升級到了 7.13，導致原來有些程式的邏輯需要更新。
其中有一個就是 ElasticSearch 索引中的每個文檔不再接受一個自己定義的 mapping type (_type) 了，所有的document的
預設的 mapping type 都是 _doc，並且也不需要一個欄位來特別表示了。

`Before 7.0.0, the mapping definition included a type name. Elasticsearch 7.0.0 and later no longer 
accept a default mapping.`

### # TL;DR

好處
1. 將有不同schema的資料儲存在同一個索引中，可能會導致資料太稀疏或者干擾到Lucene壓縮資料的效能;
2. 獨立的索引，可以避免一個相同field名稱，但是卻需要有不同資料類型的囧境發生，因為一個索引裡面的相同名字的欄位的
資料型態必須要是一致的;

如果還是需要類似原來一個 document mapping types 的功能，可以嘗試下面幾種做法:

1. 一個索引裡面都是相同的 document type，簡單來說就是把索引涵蓋的資料範圍縮小;
2. 或者自己模擬一個 type 欄位，這個方法會使得在一個索引裡面有不同 schema 的資料;


在7.0.0版本之前的 ElasticSearch 如果要模擬文檔之間的一對多 Parent/Child 關係，會在同一個index裡面定義兩個自定義
 mapping type ，分別表示 parent 和 child。但是如果把 _doc 欄位砍掉，Parent/Child 關係就不能這樣子建立了。所以，
就有了新的 join 類型的欄位出現。


### # Reference

1. [小信豬的原始部落](https://godleon.github.io/blog/Elasticsearch/Elasticsearch-getting-started/)

2. [Removal of mapping types](
https://www.elastic.co/guide/en/elasticsearch/reference/current/removal-of-types.html)
