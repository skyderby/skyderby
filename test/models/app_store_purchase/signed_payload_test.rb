require 'test_helper'

class AppStorePurchase::SignedPayloadTest < ActiveSupport::TestCase
  include AppStoreJwsHelper

  setup { use_test_app_store_root }
  teardown { restore_app_store_root }

  test 'returns payload of valid jws' do
    jws = sign_app_store_payload({ hello: 'world' })

    assert_equal({ 'hello' => 'world' }, AppStorePurchase::SignedPayload.new(jws).payload)
  end

  test 'rejects leaf that is not issued by intermediate' do
    other_chain = build_other_chain
    chain = app_store_chain.merge(leaf: other_chain[:leaf], leaf_key: other_chain[:leaf_key])

    error = assert_raises(AppStorePurchase::SignedPayload::InvalidError) do
      AppStorePurchase::SignedPayload.new(sign_app_store_payload({ a: 1 }, chain:)).payload
    end
    assert_equal 'Certificate chain verification failed', error.message
  end

  test 'rejects certificates without apple extensions' do
    chain = app_store_chain.merge(leaf: app_store_chain[:intermediate])

    assert_raises(AppStorePurchase::SignedPayload::InvalidError) do
      AppStorePurchase::SignedPayload.new(sign_app_store_payload({ a: 1 }, chain:)).payload
    end
  end

  test 'rejects unsupported algorithm' do
    header = Base64.urlsafe_encode64({ alg: 'none' }.to_json, padding: false)
    body = Base64.urlsafe_encode64({ a: 1 }.to_json, padding: false)

    assert_raises(AppStorePurchase::SignedPayload::InvalidError) do
      AppStorePurchase::SignedPayload.new("#{header}.#{body}.").payload
    end
  end

  test 'rejects malformed input' do
    assert_raises(AppStorePurchase::SignedPayload::InvalidError) do
      AppStorePurchase::SignedPayload.new('garbage').payload
    end
  end

  private

  def build_other_chain
    original = @app_store_chain
    @app_store_chain = nil
    app_store_chain
  ensure
    @app_store_chain = original
  end
end
