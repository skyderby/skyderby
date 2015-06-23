Feature: uploading tracks
	In order to analyze tracks
	As an wingsuit pilot
	I want to be sure I fill form correct

	Background:
		Given that I arrive to the site
		And I specify that I wish to upload track

	@javascript
	Scenario: not uploading anything
		When I fail to attach a track
		Then I should not be able to submit

	@javascript
	Scenario: not specify name
		When I fail to specify name
		Then I should not be able to submit

	@javascript
	Scenario: not specify suit
		When I fail to specify suit
		Then I should not be able to submit

	@javascript
	Scenario: not specify place
		When I fail to specify place
		Then I should not be able to submit
