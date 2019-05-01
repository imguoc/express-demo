var mysql = require('mysql');
var config = require('../db/config');
var pool = mysql.createPool(config);

// 连接数据库
pool.getConnection(function(err) {
    if (!err) {
        console.log('db连接成功');
    } else {
        console.log('db连接错误：' + err.stack);
        return;
    }
})

// 关闭数据库
// pool.end(function(err) {
//     if (!err) {
//         console.log('db关闭成功')
//     } else {
//         console.log('db关闭失败：' + err)
//     }
// })

var router = function(app) {

    app.get('/query', function(req, res) {
        var name = req.query.name
        var pageIndex = req.query.pageIndex || 1;
        var pageSize = req.query.pageSize || 5;
        var sql = '';
        var pageSql = 'select count(*) as pageTotal from test';
        if (name) {
            sql = 'select * from test where name="' + name + '"';
        } else {
            sql = 'select * from test order by id desc limit ' + (pageIndex - 1) * pageSize + ',' + pageSize;
        }
        pool.query(sql, function(error, result, filed) {
            if (error) throw error;
            pool.query(pageSql, function(pageError, pageResult, pageFiled) {
                if (pageError) throw pageError;
                res.json({
                    code: 200,
                    msg: 'success',
                    pageInfo: {
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                        pageTotal: Math.ceil(pageResult[0]['pageTotal'] / pageSize)
                    },
                    data: result
                })
            })
        })
    })

    app.get('/create', function(req, res) {
        var sql = 'insert into test (name) values ("' + req.query.name + '")';
        pool.query(sql, function(error, result, field) {
            if (error) throw error;
            res.json({
                code: 200,
                msg: 'success'
            })
        })
    })

    app.get('/update', function(req, res) {
        var sql = 'update test set name="' + req.query.name + '" where id="' + req.query.id + '"';
        pool.query(sql, function(error, result, field) {
            if (error) throw error;
            res.json({
                code: 200,
                msg: 'success'
            })
        })
    })

    app.get('/delete', function(req, res) {
        var id = req.query.id;
        var sql = 'delete from test where id=' + id;
        pool.query(sql, function(error, result, filed) {
            if (error) throw error;
            res.json({
                code: 200,
                msg: 'success'
            })
        })
    })
}

module.exports = router;
