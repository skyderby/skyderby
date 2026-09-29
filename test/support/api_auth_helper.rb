module ApiAuthHelper
  def bearer(token_fixture)
    { 'Authorization' => "Bearer #{oauth_access_tokens(token_fixture).token}" }
  end
end
