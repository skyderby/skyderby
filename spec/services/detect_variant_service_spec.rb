require 'spec_helper'

describe DetectVariantService do
  MOBILE_AGENTS = {
    android: 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
    blackbery: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+',
    win_phone: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)',
    iphone: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
  }.freeze

  DESKTOP_AGENTS = {
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
    chrome: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
    firefox: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
  }.freeze

  MOBILE_AGENTS.each do |device, user_agent|
    it "detects #{device} as mobile" do
      expect(DetectVariantService.new(user_agent).mobile?).to be_truthy
    end
  end

  DESKTOP_AGENTS.each do |device, user_agent|
    it "detects #{device} as desktop" do
      expect(DetectVariantService.new(user_agent).mobile?).to be_falsey
    end
  end

  it 'returns false on missed user agent (i.e. curl)' do
    expect(DetectVariantService.new(nil).mobile?).to be_falsey
  end
end
