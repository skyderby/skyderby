Feature: uploading tracks
	In order to analyze tracks
	As an wingsuit pilot
	I want to upload tracks
	And specify place, suit, kind and comment

	Background:
		Given that I arrive to the site
		And I specify that I wish to upload track

	@javascript
	Scenario Outline: uploading tracks with one segment
		When I fill 'Aleksandr K.' in name
		And I select Ghost 3 in suit text field
		And I specify location
		And I attach a "<track>" file
		And I click submit
		Then I should see edit track page to specify free fall range
		Examples:
			| track          |
			| one_track.gpx  |
			| flysight.csv   |
			| columbus.csv   |
			| wintec.tes     |
			| cyber_eye.csv  |

	@javascript
	Scenario: uploading track with many segments
		When I fill 'Aleksandr K.' in name
		And I select Ghost 3 in suit text field
		And I specify location
		And I attach a "two_tracks.gpx" file
		And I click submit
		Then I shoud see choose track page
		And select segment I want to analyze
		Then I should see edit track page to specify free fall range
