class AndroidAssetLinksController < ApplicationController
  PACKAGE_NAME = 'io.skyderby.android'.freeze
  FINGERPRINTS = %w[
    1B:BD:11:EA:6F:03:EE:01:0A:84:40:E1:3A:53:D4:DA:8A:B9:AB:02:0D:4F:48:19:70:0F:30:BF:DC:A7:BE:27
    48:DB:93:D1:95:63:46:D5:E3:FF:E5:62:DD:71:24:2A:19:C1:76:16:1B:46:04:DC:B9:51:F6:EF:13:32:36:09
  ].freeze

  def show
    render json: [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: { namespace: 'android_app', package_name: PACKAGE_NAME, sha256_cert_fingerprints: FINGERPRINTS }
      }
    ]
  end
end
