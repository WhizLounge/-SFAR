using System;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers;

public class PagedList <T>  : List<T>
{
public PagedList(List<T> item, int count, int pageNumber, int pageSize)
{
    Metadata = new PaginationMetadata
    {
        TotalCount = count,
        PageSize = pageSize,
        CurrentPage = pageNumber,
        TotalPages = (int)Math.Ceiling(count/(double)pageSize)
    };
    AddRange(item);
}
public PaginationMetadata Metadata { get; set; }
public static async Task<PagedList<T>> ToPagedList(IQueryable<T>query,
 int pageNumber, int pageSize)
 {
    var count = await query.CountAsync();
    var items = await query.Skip((pageNumber - 1)* pageSize).Take(pageSize).ToListAsync();
    return new PagedList<T>(items, count, pageNumber, pageSize);
 }
}
