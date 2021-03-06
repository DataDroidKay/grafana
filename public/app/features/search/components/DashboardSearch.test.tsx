import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mockSearch } from './mocks';
import { DashboardSearch } from './DashboardSearch';
import { searchResults } from '../testData';

beforeEach(() => {
  jest.useFakeTimers();
  mockSearch.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

const setup = async (): Promise<any> => {
  const props: any = {
    onCloseSearch: () => {},
  };
  let wrapper;
  //@ts-ignore
  await act(async () => {
    wrapper = await mount(<DashboardSearch {...props} />);
    jest.runAllTimers();
  });
  return wrapper;
};

/**
 * Need to wrap component render in async act and use jest.runAllTimers to test
 * calls inside useDebounce hook
 */
describe('DashboardSearch', () => {
  it('should call search api with default query when initialised', async () => {
    await setup();

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch).toHaveBeenCalledWith({
      query: '',
      tag: [],
      skipRecent: false,
      skipStarred: false,
      starred: false,
      folderIds: [],
    });
  });

  it('should call api with updated query on query change', async () => {
    let wrapper = await setup();

    //@ts-ignore
    await act(async () => {
      // @ts-ignore
      await wrapper
        .find({ placeholder: 'Search dashboards by name' })
        .hostNodes()
        //@ts-ignore
        .prop('onChange')({ currentTarget: { value: 'Test' } });

      jest.runAllTimers();
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: 'Test',
      skipRecent: false,
      skipStarred: false,
      tag: [],
      starred: false,
      folderIds: [],
    });
  });

  it("should render 'No results' message when there are no dashboards", async () => {
    let wrapper = await setup();

    wrapper.update();
    expect(
      wrapper.findWhere((c: any) => c.type() === 'h6' && c.text() === 'No dashboards matching your query were found.')
    ).toHaveLength(1);
  });

  it('should render search results', async () => {
    //@ts-ignore
    mockSearch.mockImplementation(() => Promise.resolve(searchResults));
    let wrapper = await setup();
    wrapper.update();
    expect(wrapper.find({ 'aria-label': 'Search section' })).toHaveLength(2);
    expect(wrapper.find({ 'aria-label': 'Search items' }).children()).toHaveLength(2);
  });

  it('should call search with selected tags', async () => {
    let wrapper = await setup();

    //@ts-ignore
    await act(async () => {
      //@ts-ignore
      await wrapper.find('TagFilter').prop('onChange')(['TestTag']);
      jest.runAllTimers();
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: '',
      skipRecent: false,
      skipStarred: false,
      tag: ['TestTag'],
      starred: false,
      folderIds: [],
    });
  });
});
