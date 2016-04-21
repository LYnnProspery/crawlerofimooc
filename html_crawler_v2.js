var http = require('http');
var Promise = require('bluebird');
var url = 'http://www.imooc.com/learn/';
var cheerio = require('cheerio');

var videoIds = [348, 637, 259, 197, 134];


function filterChapters(html) {
	var $ = cheerio.load(html);
	var chapters = $('.chapter');

	var title = $('#main .path span').text();
	var anumber = $('.course-infos .statics .static-item strong').eq(3).text();

	// courseInfo = {
	// 	title: title,
	// 	numbers: number,
	// 	videos: [{
	// 		chapterTitle:'',
	// 		videos:[
	// 			title:'',
	// 			id:''
	// 		]
	// 	}
	// 	]
	// }

	var courseInfo = {
		title: title,
		numbers: anumber,
		videos: []
	};


	chapters.each(function(index, element) {
		var chapter = $(element);
		var title = chapter.find('strong').text();	
		var chapterData = {
			chapterTitle: title,
			videos: []
		};

		var videoData = chapter.find('li');

		videoData.each(function(index, element){
			
			var video = $(element).find('.studyvideo');
			var videoTitle = video.text();
			var id = video.attr('href');

			chapterData.videos.push({
				title: videoTitle,
				id: id
			});
		});

		courseInfo.videos.push(chapterData);
		
	});

	return courseInfo;
}

function printIt(coursesData) {
	coursesData.forEach(function (courseInfo){
		console.log(courseInfo.numbers + '人学了' + courseInfo.title + '\t');

	});
	coursesData.forEach(function (courseInfo){
		console.log('--------------');
		courseInfo.videos.forEach(function (element){
		var chapterTitle = element.chapterTitle;
		console.log(chapterTitle + '\n');

		element.videos.forEach(function (element) {
			console.log('    【' + element.id + '】   ' + element.title.trim() + '\n');
		});
	});

	})

	
}


function getcoursesAsync(url){
	return new Promise(function (resolve, reject){
		console.log('crawling' + url);
		http.get(url, function (res){
			var html = '';
			res.on('data', function (data){
				html += data;
			});
			res.on('end', function (){
				// var courseInfo = filterChapters(html);
				// printIt(courseInfo);
				resolve(html);
			});
		}).on('error', function (e){
			reject(e);
			console.log('获取出错');
		});

	})

}

var coursesArray = [];

videoIds.forEach(function (id){
	coursesArray.push(getcoursesAsync(url + id));
})


Promise
	.all(coursesArray)
	.then(function (pages){
		var coursesData = [];
		pages.forEach(function(html) {
			//courses is obj
			var courses = filterChapters(html);

			coursesData.push(courses);
		});
		coursesData.sort(function(a, b){
			a.numbers - b.numbers;
		})


		printIt(coursesData);

	});

