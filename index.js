'use strict'

var Crawler = require("crawler");
var url = require('url');
var ini = require('ini');
var fs = require('fs');
var mysql = require('mysql');
var argv = require('minimist')(process.argv.slice(2));
var env = argv.e;

var allTheThings = [];
var nextExhibitor = null;
var lastExhibitor = null;
var nextCrawlSite = null;
var firstPage = true;

var dbConfig = {
  host     : "127.0.0.1",
  port      : "8889",
  user     : "ibc",
  password : "ibc",
  database : "ibc"
}

var connection = mysql.createConnection(dbConfig);

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);


  var c = new Crawler({
    maxConnections: 7,
    forceUTF8: true,
    // This will be called for each crawled page
    callback: function(error, result, $) {
      //Case Overview-Page
      if (error) {
        console.log(error);
        return;
      } else {
        if (firstPage) {
          console.log("Gathering first page links")
          var i = 0
          $('a.search_index_active').each(function(index, item) {
            nextCrawlSite = "https://service.dmexco.de" + item.attribs.href
            if (i < 23) {
              c.queue(nextCrawlSite);
              i++
            } 
          });
          firstPage = false
        }

        if ($("td.Adresse").length > 0) {
          console.log("Gathering companies")
          $("td.Adresse").each(function(index, item) {
            var nextCompany = "https://service.dmexco.de" + item.children[0].next.attribs.href
            c.queue(nextCompany);
          })
        }

        if ($('.ausstellerReiter').length > 0) {
          // console.log("Found the appropriate ul class.....")
          $("a:contains('Ausstellerkategorien')").each(function(index, item) {
            var companyCategoriesPage = "https://service.dmexco.de" + item.attribs.href
            c.queue(companyCategoriesPage);
          })
        }

        if ($('dd').length > 0) {
          var companyInfo = {
            name: '',
            categories: [],
            url: ''
          }
          
          var name = $('strong').text()

          var companyProfile = $('.c58l').html() // target the company profile area
          var myRegExp = /target="_new">(https?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w \.-]*\/?)<\/a>/
          var companyUrl = myRegExp.exec(companyProfile)[1] // .exec() and [1] returns the first match group
          
          companyInfo.name = name
          companyInfo.url = companyUrl

          $('dd').each(function(index, item) {
            companyInfo.categories.push(item.children[0].children[0].data);
          });

          companyInfo.categories = companyInfo.categories.toString()
          console.log(companyInfo);

          connection.query('INSERT INTO companies SET ?', companyInfo, function(err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
        }
      }
    }
  });

console.log("Start Crawling");

c.queue('https://service.dmexco.de/km_vis-cgi/km_vis/vis/custom/ext2/show_exhibitors.cgi?ticket=k0013975787261&exh_all=1');


