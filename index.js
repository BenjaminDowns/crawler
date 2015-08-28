'use strict'

var Crawler = require("crawler");
var url = require('url');
var ini = require('ini');
var fs = require('fs');
// var mysql = require('mysql');
var argv = require('minimist')(process.argv.slice(2));
var env = argv.e;

var companies = [];



var nextExhibitor = null;
var lastExhibitor = null;
var nextCrawlSite = null;
var firstPage = true;
var c = new Crawler({
  maxConnections: 5,
  forceUTF8: true,
  // This will be called for each crawled page
  callback: function(error, result, $) {
    //Case Overview-Page
    if (error) {
      console.log(error);
      return;
    } else {
      if (firstPage) {
        var i = 0
        $('a.search_index_active').each(function(index, item) {
          var nextCrawlSite = item.attribs.href
          if (i < 23) {
            c.queue(nextCrawlSite);
            // console.log("\n\n" + i + ") " + nextCrawlSite)
            i++
          } else {
            console.log("\n\n done queueing \n\n")
          }
        });
        firstPage = false
      }
      $('td.Adresse').each(function(index, item) {
        console.log("getting exhibitor page")
        var nextExhibitor = "https://service.dmexco.de" + item.children[0].next.attribs.href
        c.queue(nextExhibitor);
      })
      $('div.c581').each(function(index, item) {
        var companyName = ''
        var nameRegex = /<strong>(.*)<\/strong>/
        companyName = companyName.replace(nameRegex)
      })
    }
  }
});

console.log("Start Crawling");
// Queue just one URL, with default callback
c.queue('https://service.dmexco.de/km_vis-cgi/km_vis/vis/custom/ext2/show_exhibitors.cgi?alpha_index=A_1_20%2CB_3_43%2CC_3_61%2CD_4_523%2CE_4_109%2CF_4_115%2CG_5_571%2CH_5_138%2CI_5_848%2CK_6_160%2CL_6_171%2CM_7_177%2CN_7_600%2CO_8_211%2CP_8_465%2CQ_9_704%2CR_9_779%2CS_9_816%2CT_11_718%2CU_11_306%2CV_11_515%2CW_12_324%2CY_13_336%2CZ_13_566&ticket=k8894901500056&prod_no=01&backto=show_product&leaf=1&i_exh_num=125&to=10&from=0#exh_20');


// if(firstPage) {
//     $(".ez_nav_bottom a.listnavpagenum").each(function(index,item) {
//         if($(item).attr("pagenum") != 1) {
//             nextCrawlSite = $(item).attr("href");
//             if (nextCrawlSite!= null) {
//                 c.queue(nextCrawlSite);
//                 console.log("Added another listing");
//             }
//         }
//     });
//     firstPage = false;
// }





// database information

// var dbConfig = {
//   host     : "127.0.0.1",
//   port      : "8889",
//   user     : "ibc",
//   password : "ibc",
//   database : "ibc"
// }

// var connection = mysql.createConnection(dbConfig);

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log('connected as id ' + connection.threadId);