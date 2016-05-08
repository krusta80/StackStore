app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($scope, $sce) {
	
	var videos = [
		'blue.mp4',
		'mix.mp4',
		'http://ak9.picdn.net/shutterstock/videos/4405619/preview/stock-footage-moscow-jul-moving-camera-wide-view-timelapse-customers-buying-products-in-auchan-mall-on.mp4',
		'http://i.istockimg.com/video_passthrough/79721929/153/79721929.mp4'
	];

	var getRandomVideo = function() {
		return videos[Math.floor(Math.random()*videos.length)]
	};

	 $scope.trustSrc = function(src) {
	 	return $sce.trustAsResourceUrl(src);
	 }

	$scope.video = getRandomVideo();
});