class AppStorePurchase::SignedPayload
  class InvalidError < StandardError; end

  LEAF_CERTIFICATE_OID = '1.2.840.113635.100.6.11.1'.freeze
  INTERMEDIATE_CERTIFICATE_OID = '1.2.840.113635.100.6.2.1'.freeze

  cattr_accessor :root_certificate_path, default: Rails.root.join('config/certs/AppleRootCA-G3.cer')

  def initialize(jws)
    @jws = jws.to_s
  end

  def payload
    @payload ||= verified_payload
  end

  private

  attr_reader :jws

  def verified_payload
    header_segment, payload_segment, signature_segment = segments
    header = decode_json(header_segment)
    raise InvalidError, 'Unsupported algorithm' unless header['alg'] == 'ES256'

    leaf = verified_leaf_certificate(header['x5c'])
    verify_signature!(leaf, "#{header_segment}.#{payload_segment}", decode(signature_segment))

    decode_json(payload_segment)
  rescue JSON::ParserError, ArgumentError, OpenSSL::X509::CertificateError, OpenSSL::PKey::PKeyError => e
    raise InvalidError, e.message
  end

  def segments
    parts = jws.split('.')
    raise InvalidError, 'Malformed JWS' unless parts.size == 3

    parts
  end

  def verified_leaf_certificate(chain)
    raise InvalidError, 'Certificate chain is missing' unless chain.is_a?(Array) && chain.size == 3

    leaf, intermediate, root = chain.map { |der| OpenSSL::X509::Certificate.new(Base64.strict_decode64(der)) }
    raise InvalidError, 'Untrusted root certificate' unless root.to_der == trusted_root.to_der

    verify_apple_extensions!(leaf, intermediate)
    raise InvalidError, 'Certificate chain verification failed' unless trust_store.verify(leaf, [intermediate])

    leaf
  end

  def verify_apple_extensions!(leaf, intermediate)
    raise InvalidError, 'Invalid leaf certificate' unless apple_extension?(leaf, LEAF_CERTIFICATE_OID)
    return if apple_extension?(intermediate, INTERMEDIATE_CERTIFICATE_OID)

    raise InvalidError, 'Invalid intermediate certificate'
  end

  def verify_signature!(certificate, signing_input, signature)
    raise InvalidError, 'Invalid signature' unless signature.bytesize == 64

    r = OpenSSL::BN.new(signature.byteslice(0, 32), 2)
    s = OpenSSL::BN.new(signature.byteslice(32, 32), 2)
    der_signature = OpenSSL::ASN1::Sequence.new([OpenSSL::ASN1::Integer.new(r), OpenSSL::ASN1::Integer.new(s)]).to_der

    return if certificate.public_key.verify(OpenSSL::Digest.new('SHA256'), der_signature, signing_input)

    raise InvalidError, 'Invalid signature'
  end

  def apple_extension?(certificate, oid)
    certificate.extensions.any? { |extension| extension.oid == oid }
  end

  def trusted_root
    @trusted_root ||= OpenSSL::X509::Certificate.new(File.binread(root_certificate_path))
  end

  def trust_store
    OpenSSL::X509::Store.new.tap { |store| store.add_cert(trusted_root) }
  end

  def decode(segment) = Base64.urlsafe_decode64(segment)

  def decode_json(segment) = JSON.parse(decode(segment))
end
