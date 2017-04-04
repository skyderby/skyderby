class SponsorsCopyService
  def call(source:, target:)
    @target = target
    source.sponsors.map { |sponsor| copy(sponsor) }
  end

  private

  attr_reader :target

  def copy(sponsor)
    new_sponsor = sponsor.dup
    new_sponsor.sponsorable = target
    new_sponsor.logo = sponsor.logo
    new_sponsor.save
    new_sponsor.errors
  end
end
