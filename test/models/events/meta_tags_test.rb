require 'test_helper'

class Events::MetaTagsTest < ActiveSupport::TestCase
  setup do
    @tournament = tournaments(:world_base_race)
    @meta = Events::MetaTags.new(@tournament, url: 'https://skyderby.ru/events/tournaments/1')
  end

  test '#sport maps each event type to its schema.org sport' do
    assert_equal 'BASE Race', Events::MetaTags.new(Tournament.new).sport
    assert_equal 'Wingsuit performance flying', Events::MetaTags.new(PerformanceCompetition.new).sport
    assert_equal 'Speed skydiving', Events::MetaTags.new(SpeedSkydivingCompetition.new).sport
    assert_equal 'Tracking competition', Events::MetaTags.new(Boogie.new).sport
  end

  test '#description composes sport, place, date, participants and CTA' do
    description = @meta.description

    assert_includes description, 'BASE Race at Hellesylt(WBR), Norway'
    assert_includes description, 'July 3, 2016'
    assert_includes description, '1 competitor from 1 country'
    assert_includes description, 'Skyderby'
  end

  test '#structured_data builds a SportsEvent with location, country and geo' do
    data = @meta.structured_data

    assert_equal 'SportsEvent', data['@type']
    assert_equal 'WBR', data['name']
    assert_equal 'BASE Race', data['sport']
    assert_equal 'https://skyderby.ru/events/tournaments/1', data['url']
    assert_equal '2016-07-03', data['startDate']
    assert_equal 'Norway', data.dig('location', 'address', 'addressCountry')
    assert_in_delta 62.0578, data.dig('location', 'geo', 'latitude'), 0.001
  end

  test '#structured_data escapes HTML entities so it is safe inside a script tag' do
    @tournament.name = 'Evil </script>'
    json = @meta.structured_data.to_json

    assert_not_includes json, '</script>'
    assert_nothing_raised { JSON.parse(json) }
  end

  test '#indexable? is true only for public, published or finished events' do
    @tournament.visibility = :public_event

    %i[published finished].each do |status|
      @tournament.status = status
      assert_predicate Events::MetaTags.new(@tournament), :indexable?, "expected indexable when #{status}"
    end

    %i[draft surprise].each do |status|
      @tournament.status = status
      assert_not Events::MetaTags.new(@tournament).indexable?, "expected not indexable when #{status}"
    end
  end

  test '#indexable? is false for unlisted and private events' do
    @tournament.status = :published

    %i[unlisted_event private_event].each do |visibility|
      @tournament.visibility = visibility
      assert_not Events::MetaTags.new(@tournament).indexable?, "expected not indexable when #{visibility}"
    end
  end
end
