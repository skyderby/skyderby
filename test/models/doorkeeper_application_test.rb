# frozen_string_literal: true

require 'test_helper'

class DoorkeeperApplicationTest < ActiveSupport::TestCase
  test 'allows custom scheme redirect URIs' do
    app = Doorkeeper::Application.new(
      name: 'Test App',
      redirect_uri: 'skygames://oauth/skyderby/callback'
    )

    assert_predicate app, :valid?, app.errors.full_messages.join(', ')
  end

  test 'allows http://localhost redirect URIs' do
    app = Doorkeeper::Application.new(
      name: 'Test App',
      redirect_uri: 'http://localhost/callback'
    )

    assert_predicate app, :valid?, app.errors.full_messages.join(', ')
  end

  test 'allows multiple redirect URIs with mixed schemes' do
    app = Doorkeeper::Application.new(
      name: 'Test App',
      redirect_uri: "skygames://oauth/skyderby/callback\nskygames://oauth/skyderby/dev/callback\nhttp://localhost/callback"
    )

    assert_predicate app, :valid?, app.errors.full_messages.join(', ')
  end

  test 'requires https for non-localhost http URIs' do
    app = Doorkeeper::Application.new(
      name: 'Test App',
      redirect_uri: 'http://example.com/callback'
    )

    assert_not app.valid?
    assert_predicate app.errors[:redirect_uri], :any?
  end

  test 'allows https redirect URIs' do
    app = Doorkeeper::Application.new(
      name: 'Test App',
      redirect_uri: 'https://example.com/callback'
    )

    assert_predicate app, :valid?, app.errors.full_messages.join(', ')
  end
end
