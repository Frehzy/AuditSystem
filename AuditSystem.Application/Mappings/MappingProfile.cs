using AutoMapper;
using AuditSystem.Application.Features.Auth.Commands;
using AuditSystem.Domain.Entities;
using AuditSystem.Shared.DTOs.Auth;
using System.Text.Json.Serialization;

namespace AuditSystem.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<LoginCommand, UserEntity>();
        CreateMap<UserEntity, UserDto>();
    }
}