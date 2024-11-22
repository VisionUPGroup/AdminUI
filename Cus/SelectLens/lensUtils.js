export const mappingLensTypesWithLensData = (lensData, lensTypes) => {
    return lensTypes
      .filter(item => item.status)
      .map(item => ({
        id: item.id,
        title: item.description,
        subOptions: lensData.filter(
          lens => lens.lensType.id === item.id && lens.status
        ),
      }));
  };