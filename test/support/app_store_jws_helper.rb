module AppStoreJwsHelper
  def app_store_chain
    @app_store_chain ||= begin
      root_key = OpenSSL::PKey::EC.generate('prime256v1')
      root = app_store_certificate(name: 'Test Root', key: root_key, issuer: nil, issuer_key: root_key, authority: true)
      intermediate_key = OpenSSL::PKey::EC.generate('prime256v1')
      intermediate = app_store_certificate(
        name: 'Test Intermediate', key: intermediate_key, issuer: root, issuer_key: root_key, authority: true,
        oid: AppStorePurchase::SignedPayload::INTERMEDIATE_CERTIFICATE_OID
      )
      leaf_key = OpenSSL::PKey::EC.generate('prime256v1')
      leaf = app_store_certificate(
        name: 'Test Leaf', key: leaf_key, issuer: intermediate, issuer_key: intermediate_key, authority: false,
        oid: AppStorePurchase::SignedPayload::LEAF_CERTIFICATE_OID
      )
      { root:, intermediate:, leaf:, leaf_key: }
    end
  end

  def use_test_app_store_root(root = app_store_chain[:root])
    @original_app_store_root_path = AppStorePurchase::SignedPayload.root_certificate_path
    @app_store_root_file = Tempfile.new(['app_store_root', '.cer'])
    @app_store_root_file.binmode
    @app_store_root_file.write(root.to_der)
    @app_store_root_file.flush
    AppStorePurchase::SignedPayload.root_certificate_path = @app_store_root_file.path
  end

  def restore_app_store_root
    AppStorePurchase::SignedPayload.root_certificate_path = @original_app_store_root_path
    @app_store_root_file&.close!
  end

  def sign_app_store_payload(payload, chain: app_store_chain)
    header = {
      alg: 'ES256',
      x5c: chain.values_at(:leaf, :intermediate, :root).map { |cert| Base64.strict_encode64(cert.to_der) }
    }
    signing_input = [header, payload].map { |part| Base64.urlsafe_encode64(part.to_json, padding: false) }.join('.')
    der_signature = chain[:leaf_key].sign(OpenSSL::Digest.new('SHA256'), signing_input)
    raw_signature = OpenSSL::ASN1.decode(der_signature).value.map { |int| int.value.to_s(2).rjust(32, "\x00".b) }.join

    "#{signing_input}.#{Base64.urlsafe_encode64(raw_signature, padding: false)}"
  end

  def app_store_transaction_payload(**overrides)
    {
      bundleId: 'io.skyderby.app',
      productId: 'io.skyderby.pro.monthly',
      transactionId: '2000000000000002',
      originalTransactionId: '2000000000000001',
      environment: 'Sandbox',
      purchaseDate: 1.day.ago.to_i * 1000,
      expiresDate: 29.days.from_now.to_i * 1000
    }.merge(overrides)
  end

  private

  def app_store_certificate(name:, key:, issuer:, issuer_key:, **)
    cert = OpenSSL::X509::Certificate.new
    cert.version = 2
    cert.serial = SecureRandom.random_number(2**64)
    cert.subject = OpenSSL::X509::Name.parse("/CN=#{name}")
    cert.issuer = issuer ? issuer.subject : cert.subject
    cert.public_key = key
    cert.not_before = 1.day.ago
    cert.not_after = 1.year.from_now
    add_app_store_extensions(cert, issuer || cert, **)
    cert.sign(issuer_key, OpenSSL::Digest.new('SHA256'))
    cert
  end

  def add_app_store_extensions(cert, issuer, authority:, oid: nil)
    factory = OpenSSL::X509::ExtensionFactory.new
    factory.subject_certificate = cert
    factory.issuer_certificate = issuer
    cert.add_extension(factory.create_extension('basicConstraints', authority ? 'CA:TRUE' : 'CA:FALSE', true))
    cert.add_extension(factory.create_extension('keyUsage', authority ? 'keyCertSign,cRLSign' : 'digitalSignature',
                                                true))
    cert.add_extension(OpenSSL::X509::Extension.new(oid, OpenSSL::ASN1::Null.new(nil).to_der)) if oid
  end
end
