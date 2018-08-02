shared_examples 'event_ongoing_validation' do
  context 'on change' do
    before do
      @target = target
      @target.event.finished!
      @target.save
    end

    it 'should be invalid if event finished' do
      expect(@target).to be_invalid
    end

    it 'should have error message' do
      expect(@target.errors.messages[:base]).to include(I18n.t('activerecord.errors.models.event/competitor.attributes.base.event_finished'))
    end
  end

  context 'on destroy' do
    before do
      @target = target
      @target.event.finished!
    end

    it 'can\'t be destroyed' do
      expect(@target.destroy).to be_falsey
    end

    it 'should have error message' do
      @target.destroy
      expect(@target.errors.messages[:base]).to include(I18n.t('activerecord.errors.models.event/competitor.attributes.base.event_finished'))
    end
  end
end
