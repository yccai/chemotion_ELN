import React from 'react'
import expect from 'expect'
import { mount } from 'enzyme'
import fakeReaction from '../fixture/reaction'
import { settings, configs } from '../fixture/report'
import Reports from '../../../app/assets/javascripts/components/report/Reports'
import {StatusContent} from '../../../app/assets/javascripts/components/report/ReportElements'

describe('Reports', () => {
  const wrapper = (selectedReactions, settings, configs) => {
    return mount(<Reports selectedReactions={selectedReactions}
                          settings={settings}
                          configs={configs} />)
  }

  describe('checked all settings', () => {
    describe('with 0 reaction input', () => {
      it('should render nothing', () => {
        const expected = ""
        const actual = wrapper([], settings, configs).html()
        expect(actual).toInclude(expected)
      })
    })

    describe('with 1 reaction input', () => {
      it('should render a report header, materials, solvent, description, purification, tlc, observation', () => {
        const expected = fakeReaction
        const actual = wrapper([fakeReaction], settings, configs).html()
        expect(actual).toInclude(fakeReaction.starting_materials[0].short_label).
          toInclude(fakeReaction.starting_materials[0].molecule.sum_formular).
          toInclude(fakeReaction.reactants[0].short_label).
          toInclude(fakeReaction.reactants[0].molecule.sum_formular).
          toInclude(fakeReaction.products[0].short_label).
          toInclude(fakeReaction.products[0].molecule.sum_formular).
          toInclude(fakeReaction.solvent).
          toInclude(fakeReaction.description_contents).
          toInclude(fakeReaction.purification[0]).
          toInclude(fakeReaction.tlc_solvents).
          toInclude(fakeReaction.tlc_description).
          toInclude(fakeReaction.observation)
      })
    })

    describe('with 3 reaction input', () => {
      it('should render 3 reactions', () => {
        const input_reaction_array = [fakeReaction, fakeReaction, fakeReaction]
        const actual = wrapper(input_reaction_array, settings, configs)
        expect(actual.find('StatusContent').length).toEqual(input_reaction_array.length)
      })
    })
  })

  describe('unchecked all settings', () => {
    describe('with 1 reaction input', () => {
      it('should render a report header only', () => {
        const expected = fakeReaction
        const actual = wrapper([fakeReaction], [], []).html()
        expect(actual).toNotInclude(fakeReaction.solvent).
          toNotInclude(fakeReaction.description_contents).
          toNotInclude(fakeReaction.purification[0]).
          toNotInclude(fakeReaction.tlc_solvents).
          toNotInclude(fakeReaction.tlc_description).
          toNotInclude(fakeReaction.observation)
      })
    })
  })
})
